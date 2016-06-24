using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Alex.Clients.Foursquare;
using Alex.Clients.Foursquare.Models;
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
			var venue = new List<Venue>();

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
			
			// TODO: load all checkins
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

			return Json(new
			{
				checkins,
				friends
			});
		}
	}
}
