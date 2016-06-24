using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Alex.Clients.Foursquare;
using Alex.Clients.Foursquare.Models;
using Alex.Extentions;
using Alex.Models.SwarmCalculator;
using Alex.ViewModels.SwarmCalculator;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Alex.Controllers
{
	//[Route("swarm-calculator")]
	public class SwarmCalculatorController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}

		public async Task<IActionResult> Authorize(string code)
		{
			var config = Startup.Configuration.GetSection("Foursquare");
			var client = new FoursquareClient(
				config.GetValue<string>("ClientId"),
				config.GetValue<string>("ClientSecret"),
				config.GetValue<string>("ClientRedirectUrl"));

			var accessToken = await client.GetAccessTokenAsync(code);
			if (accessToken == null)
				throw new InvalidOperationException();

			var friends = new List<Friend>();
			var checkins = new List<Checkin>();
			var uniqueVenues = new List<Venue>();
			var streaks = new Dictionary<string, Streak>();

			// load all friends
			var index = 0;
			while (true)
			{
				var friendTasks = new Task<ResponseBase>[2]
				{
					client.ExecuteRequestAsync("users/self/friends", accessToken, index, index += 500),
					client.ExecuteRequestAsync("users/self/friends", accessToken, index, index += 500)
				};
				await Task.WhenAll(friendTasks);

				var oldLength = friends.Count;
				friends.AddRange(friendTasks[0].Result.Response.Friends.Items);
				friends.AddRange(friendTasks[1].Result.Response.Friends.Items);
				
				if (oldLength == friends.Count)
					break;
			}
			
			// load all checkins
			index = 0;
			while (true)
			{
				var checkinTasks = new Task<ResponseBase>[4]
				{
					client.ExecuteRequestAsync("users/self/checkins", accessToken, index, index += 250),
					client.ExecuteRequestAsync("users/self/checkins", accessToken, index, index += 250),
					client.ExecuteRequestAsync("users/self/checkins", accessToken, index, index += 250),
					client.ExecuteRequestAsync("users/self/checkins", accessToken, index, index += 250)
				};
				await Task.WhenAll(checkinTasks);

				var oldLength = checkins.Count;
				checkins.AddRange(checkinTasks[0].Result.Response.Checkins.Items);
				checkins.AddRange(checkinTasks[1].Result.Response.Checkins.Items);
				checkins.AddRange(checkinTasks[2].Result.Response.Checkins.Items);
				checkins.AddRange(checkinTasks[3].Result.Response.Checkins.Items);
				
				if (oldLength == checkins.Count)
					break;
			}

			// Get list of unique venues
			uniqueVenues = checkins
				.Where(c => c.Venue != null)
				.Select(c => c.Venue)
				.DistinctBy(v => v.Id).ToList();

			// Calculate checkins with each friend
			foreach (var friend in friends)
				friend.CheckinsWith = checkins.Where(c => c.With != null).Count(c => c.With.Any(w => w.Id == friend.Id));

			// Calculate checkins at each venue
			foreach (var venue in uniqueVenues)
				venue.CheckinsAt = checkins.Count(c => c.Venue?.Id == venue.Id);

			// Calculate streaks
			var date = DateTime.Today;
			var first = true;
			var updated = false;
			while(true)
			{
				updated = false;
				foreach (var checkin in checkins
					.Where(c => c.CreatedAt.ToDateTime().EqualsDateOnly(date))
					.Where(c => c.Venue != null)
					.DistinctBy(c => c.Venue.Id))
				{
					if (first)
					{
						if (!streaks.ContainsKey(checkin.Venue.Id))
							streaks.Add(checkin.Venue.Id, new Streak { Item = checkin.Venue, Length = 1 } );
					}
					else if (streaks.ContainsKey(checkin.Venue.Id))
					{
						streaks[checkin.Venue.Id].Length++;
						updated = true;
					}

					foreach (var category in checkin.Venue.Categories)
					{
						if (first)
						{
							if (!streaks.ContainsKey(category.Id))
								streaks.Add(category.Id, new Streak { Item = category, Length = 1 } );
						}
						else if (streaks.ContainsKey(category.Id))
						{
							streaks[category.Id].Length++;
							updated = true;
						}
					}
				}

				if (!first && !updated)
					break;

				first = false;
				date = date.AddDays(-1);
			}

			return View(new StatsViewModel
			{
				Friends = friends.Where(f => f.CheckinsWith > 0).OrderByDescending(f => f.CheckinsWith),
				Venues = uniqueVenues.Where(v => v.CheckinsAt > 0).OrderByDescending(v => v.CheckinsAt),
				Streaks = streaks.Values.Where(s => s.Length > 1).OrderByDescending(s => s.Length)
			});
		}
	}
}
