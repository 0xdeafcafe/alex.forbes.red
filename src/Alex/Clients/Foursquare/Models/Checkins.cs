using System.Collections.Generic;
using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Checkins
	{
		[JsonProperty("count")]
		public int Count { get; set; }

		[JsonProperty("items")]
		public IList<Checkin> Items { get; set; }
	}
}
