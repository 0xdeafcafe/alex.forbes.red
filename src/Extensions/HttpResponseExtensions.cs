using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Alex
{
	public static class HttpResponseExtensions
	{
		public static async Task SetContent(this HttpResponse response,
			int statusCode, byte[] content)
		{
			response.StatusCode = statusCode;
			await response.Body.WriteAsync(content, 0, content.Length);
		}
	}
}
