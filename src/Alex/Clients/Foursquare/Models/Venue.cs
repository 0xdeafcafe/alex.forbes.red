using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Venue
	{
		[JsonProperty("id")]
		public string Id { get; set; }

		[JsonProperty("name")]
		public string Name { get; set; }

		[JsonProperty("stats")]
		public Stats Stats { get; set; }

		[JsonProperty("storeId")]
		public string StoreId { get; set; }
	}
}
