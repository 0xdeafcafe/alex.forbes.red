using System.Collections.Generic;
using Alex.Clients.Foursquare.Models;
using Alex.Models.SwarmCalculator;

namespace Alex.ViewModels.SwarmCalculator
{
	public class StatsViewModel
	{
		public IEnumerable<Friend> Friends { get; set; }

		public IEnumerable<Venue> Venues { get; set; }

		public IEnumerable<Streak> Streaks { get; set; }
	}
}
