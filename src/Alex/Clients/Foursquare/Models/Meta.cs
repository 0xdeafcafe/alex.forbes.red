using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Meta
	{
		[JsonProperty("code")]
		public int Code { get; set; }
	}
}
