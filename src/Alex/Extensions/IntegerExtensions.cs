using System;

namespace Alex.Extentions
{
	public static class IntegerExtensions
	{
		private static DateTime UnixEpoc = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);

		public static DateTime ToDateTime(this int unixTimestamp)
		{
			return UnixEpoc.AddSeconds(unixTimestamp);
		}
	}
}
