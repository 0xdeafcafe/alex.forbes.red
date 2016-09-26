using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class ResponseBase
	{
		[JsonProperty("meta")]
		public Meta Meta { get; set; }

		[JsonProperty("response")]
		public Response Response { get; set; }
	}
}
