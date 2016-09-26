using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Alex.Clients.Foursquare.Models;
using Newtonsoft.Json;

namespace Alex.Clients.Foursquare
{
	public class FoursquareClient
	{
		private string _clientId;
		private string _clientSecret;
		private string _clientRedirectUrl;

		public FoursquareClient(string clientId, string clientSecret,
			string clientRedirectUrl)
		{
			_clientId = clientId;
			_clientSecret = clientSecret;
			_clientRedirectUrl = clientRedirectUrl;
		}

		public async Task<string> GetAccessTokenAsync(string code)
		{
			try
			{
				string path = "https://foursquare.com/oauth2/access_token" + 
					$"?client_id={_clientId}" + 
					$"&client_secret={_clientSecret}" + 
					"&grant_type=authorization_code" + 
					$"&redirect_uri={WebUtility.UrlEncode(_clientRedirectUrl)}" + 
					$"&code={code}";

				using (var client = new HttpClient())
				{
					var response = await client.GetAsync(path);
					var content = await response.Content.ReadAsStringAsync();
					var json = JsonConvert.DeserializeObject<AccessTokenResponse>(content);
					return json.AccessToken;
				}
			}
			catch (Exception)
			{
				return null;
			}
		}

		public async Task<ResponseBase> ExecuteRequestAsync(string path, string token, int offset = 0, int limit = 100)
		{
			path = $"https://api.foursquare.com/v2/{path}?offset={offset}&limit={limit}&oauth_token={token}&v=20160624";
			using (var client = new HttpClient())
			{
				var response = await client.GetAsync(path);
				var content = await response.Content.ReadAsStringAsync();
				var json = JsonConvert.DeserializeObject<ResponseBase>(content);
				return json;
			}
		}
	}
}
