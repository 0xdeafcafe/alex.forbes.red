using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Venue : IFoursquareItem
	{
		[JsonProperty("id")]
		public string Id { get; set; }

		[JsonProperty("name")]
		public string Name { get; set; }

		[JsonProperty("description")]
		public string Description { get; set; }

		[JsonProperty("storeId")]
		public string StoreId { get; set; }

		[JsonProperty("categories")]
		public List<Category> Categories { get; set; }

		[JsonProperty("checkinsAt")]
		public int CheckinsAt { get; set; }

		[JsonProperty("checkins")]
		public int Checkins
		{
			get { return CheckinsAt; }
		}

		[JsonProperty("photo")]
		public Photo Photo
		{
			get { return Categories.FirstOrDefault()?.Icon; }
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
