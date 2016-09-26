using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Friend : IFoursquareItem
	{
		[JsonProperty("id")]
		public string Id { get; set; }

		[JsonProperty("firstName")]
		public string FirstName { get; set; }

		[JsonProperty("lastName")]
		public string LastName { get; set; }

		[JsonProperty("name")]
		public string Name
		{
			get { return $"{FirstName} {LastName}"; }
		}

		[JsonProperty("gender")]
		public string Gender { get; set; }

		[JsonProperty("photo")]
		public Photo Photo { get; set; }

		[JsonProperty("bio")]
		public string Bio { get; set; }

		[JsonProperty("checkinsWith")]
		public int CheckinsWith { get; set; }

		[JsonProperty("checkins")]
		public int Checkins
		{
			get { return CheckinsWith; }
		}

		public override int GetHashCode()
		{
			return Id.GetHashCode();
		}

		public override bool Equals(object obj)
		{
			return Equals(obj as IFoursquareItem);
		}

		public bool Equals(IFoursquareItem other)
		{
			return (other?.Id == Id);
		}
	}
}
