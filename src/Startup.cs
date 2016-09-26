using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.IO;
using static System.IO.Directory;
using static System.IO.File;
using static System.Text.Encoding;
using System.Collections.Generic;
using System.Linq;
using System;
using HeyRed.MarkdownSharp;

namespace Alex
{
	public class Startup
	{
		private static IEnumerable<Tuple<string, byte[]>> _pages;
		private static IConfiguration _configuration;
		private static Markdown _markdown = new Markdown();

		public static void Main(string[] args)
		{
			// Get Configs
			_configuration = new ConfigurationBuilder()
				.AddCommandLine(args)
				.AddEnvironmentVariables(prefix: "ASPNETCORE_")
				.Build();

			// Get Directories
			var currentDirectory = GetCurrentDirectory();
			var pagesDirectory = Path.Combine(GetCurrentDirectory(), "pages");
			var templateHtml = ReadAllText(Path.Combine(pagesDirectory, "_template.html"));

			// Build dictionary of pages
			var markdownFiles = EnumerateFiles(pagesDirectory, "*.md", SearchOption.AllDirectories);

			// Save bytes to memory
			_pages = markdownFiles.Select(f =>
			{
				var fileInfo = new FileInfo(f);
				var markdown = ReadAllLines(f);
				var title = "index";
				if (markdown[0].StartsWith("!!  "))
					title = markdown[0].Remove(0, 3);

				var html = templateHtml
					.Replace("{{title}}", title)
					.Replace("{{content}}", _markdown.Transform(String.Join("\n", markdown.Skip(1))));
				var path = fileInfo.FullName.Remove(0, pagesDirectory.Length + 1);

				return new Tuple<string, byte[]>(path.Remove(path.Length - 3), UTF8.GetBytes(html));
			});

			// Start Server
			new WebHostBuilder()
				.UseConfiguration(_configuration)
				.UseKestrel()
				.UseContentRoot(currentDirectory)
				.UseStartup<Startup>()
				.Build()
				.Run();
		}

		public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
		{
			loggerFactory.AddConsole();
			app.UseStaticFiles();

			if (env.IsDevelopment())
				app.UseDeveloperExceptionPage();

			app.Run(async (context) =>
			{
				// Get Path
				var path = context.Request.Path.ToString().Trim('/');
				var lowerPath = path.ToLowerInvariant();

				// If path is empty - default to index
				if (string.IsNullOrEmpty(path))
					lowerPath = path = "index";

				// Get requested page - check if it exists
				var page = _pages.FirstOrDefault(p => p.Item1 == lowerPath);
				if (page == null)
				{
					await context.Response.SetContent(StatusCodes.Status404NotFound,
						_pages.First(p => p.Item1 == "not-found").Item2);
					return;
				}

				// Check the routing is correct - if not, redirect
				if (page.Item1 != path)
				{
					context.Response.Redirect(page.Item1, true);
					return;
				}

				// return page
				await context.Response.SetContent(StatusCodes.Status200OK, page.Item2);
			});
		}
	}
}
