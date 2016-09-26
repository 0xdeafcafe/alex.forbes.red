using System;

namespace Alex.Extentions
{
	public static class DateTimeExtensions
	{
		public static bool EqualsDateOnly(this DateTime source, DateTime target)
		{
			return (source.Year == target.Year &&
					source.Month == target.Month &&
					source.Day == target.Day);
		}
	}
}
