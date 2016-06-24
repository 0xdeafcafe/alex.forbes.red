using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Stats
	{
		[JsonProperty("checkinsCount")]
		public int CheckinsCount { get; set; }

		[JsonProperty("usersCount")]
		public int UsersCount { get; set; }

		[JsonProperty("tipCount")]
		public int TipCount { get; set; }
	}
}
