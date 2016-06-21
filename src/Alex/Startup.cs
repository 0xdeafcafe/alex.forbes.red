using System;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Alex
{
	public class Startup
	{
		public static IConfiguration Configuration { get; set; }

		public static IHostingEnvironment HostingEnvironment {get;set;}

		public Startup(IHostingEnvironment env)
		{
			var config = new ConfigurationBuilder()
				.SetBasePath(env.ContentRootPath)
				.AddJsonFile("config.json")
				.AddJsonFile($"config.{env.EnvironmentName.ToLowerInvariant()}.json", true)
				.AddEnvironmentVariables();

			Configuration = config.Build();
			HostingEnvironment = env;
		}

		public void ConfigureServices(IServiceCollection services)
		{
			services.AddMemoryCache();
			services.AddSession(o =>
			{
				o.CookieName = ".Alex.Session";
				o.IdleTimeout = TimeSpan.FromHours(12);
			});
			services.AddRouting(o =>
			{
				o.LowercaseUrls = true;
				o.AppendTrailingSlash = true;
			});
			services.AddMvc();
		}

		public void Configure(IApplicationBuilder app, IHostingEnvironment env,
			ILoggerFactory loggerFactory)
		{
			loggerFactory.AddConsole(Configuration.GetSection("Logging"));
			loggerFactory.AddDebug();
			app.UseStaticFiles();
			app.UseSession();

			if (env.IsDevelopment())
				app.UseDeveloperExceptionPage();
				
			app.UseMvc(routes =>
			{
				routes.MapRoute(
					name: "default",
					template: "{controller=Home}/{action=Index}/{id?}");
			});
		}

		public static void Main(string[] args)
		{
			var host = new WebHostBuilder()
				.UseKestrel()
				.UseContentRoot(Directory.GetCurrentDirectory())
				.UseStartup<Startup>()
				.Build();

			host.Run();
		}
	}
}
