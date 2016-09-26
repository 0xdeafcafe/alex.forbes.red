using Alex.Clients.Foursquare.Models;

namespace Alex.Models.SwarmCalculator
{
	public class Streak
	{
		public int Length { get; set; }

		public IFoursquareItem Item { get; set; }
	}
}
