using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class AccessTokenResponse
	{
		[JsonProperty("access_token")]
		public string AccessToken { get; set; }
	}
}
