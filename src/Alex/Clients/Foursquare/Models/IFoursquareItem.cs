using System;

namespace Alex.Clients.Foursquare.Models
{
	public interface IFoursquareItem : IEquatable<IFoursquareItem>
	{
		string Id { get; }

		string Name { get; }

		int Checkins { get; }

		Photo Photo { get; }
	}
}