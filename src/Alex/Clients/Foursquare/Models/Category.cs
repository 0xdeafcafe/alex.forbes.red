using System;
using Newtonsoft.Json;

namespace Alex.Clients.Foursquare.Models
{
	public class Category : IFoursquareItem
	{
		[JsonProperty("id")]
		public string Id { get; set; }

		[JsonProperty("name")]
		public string Name { get; set; }

		[JsonProperty("pluralName")]
		public string PluralName { get; set; }

		[JsonProperty("shortName")]
		public string ShortName { get; set; }

		[JsonProperty("icon")]
		public Photo Icon { get; set; }

		[JsonProperty("primary")]
		public bool Primary { get; set; }

		[JsonIgnore]
		public int Checkins
		{
			get { throw new NotImplementedException(); }
		}

		[JsonProperty("photo")]
		public Photo Photo
		{
			get { return Icon; }
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
