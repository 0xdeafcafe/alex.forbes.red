using System.Collections.Generic;
using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Checkin
	{
		[JsonProperty("id")]
		public string Id { get; set; }

		[JsonProperty("createdAt")]
		public int CreatedAt { get; set; }

		[JsonProperty("type")]
		public string Type { get; set; }

		[JsonProperty("venue")]
		public Venue Venue { get; set; }

		[JsonProperty("like")]
		public bool Like { get; set; }

		[JsonProperty("isMayor")]
		public bool IsMayor { get; set; }

		[JsonProperty("shout")]
		public string Shout { get; set; }

		[JsonProperty("with")]
		public IList<Friend> With { get; set; }
	}
}
