using System.Collections.Generic;
using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Friends
	{
		[JsonProperty("count")]
		public int Count { get; set; }

		[JsonProperty("items")]
		public IList<Friend> Items { get; set; }
	}
}
