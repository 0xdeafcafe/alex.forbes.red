using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Photo
	{
		[JsonProperty("prefix")]
		public string Prefix { get; set; }

		[JsonProperty("suffix")]
		public string Suffix { get; set; }
	}
}
