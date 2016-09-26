using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Response
	{
		[JsonProperty("friends")]
		public Friends Friends { get; set; }

		[JsonProperty("checkins")]
		public Checkins Checkins { get; set; }
	}
}
