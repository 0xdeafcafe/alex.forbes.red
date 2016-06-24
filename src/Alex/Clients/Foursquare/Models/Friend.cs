using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Friend
	{
		[JsonProperty("id")]
		public string Id { get; set; }

		[JsonProperty("firstName")]
		public string FirstName { get; set; }

		[JsonProperty("lastName")]
		public string LastName { get; set; }

		[JsonProperty("gender")]
		public string Gender { get; set; }

		[JsonProperty("bio")]
		public string Bio { get; set; }
	}
}
