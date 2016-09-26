using Alex.Clients.Foursquare.Models;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Alex.Clients.Foursquare.TagHelpers
{
	/// <summary>
	/// <see cref="ITagHelper"/> implementation targeting &lt;menulink&gt; elements that assist with rendering contextually aware menu links.
	/// If the current route is matched the given &lt;menulink&gt; will be active. This was added to demonstrate how a TagHelper might be used
	/// with Semantic UI to implement a simple menu.
	/// </summary>
	[HtmlTargetElement("fsq-photo", Attributes = "photo, size")]
	public class PhotoTagHelper : TagHelper
	{
		public Photo Photo { get; set; }

		public int Size { get; set; }

		public override void Process(TagHelperContext context, TagHelperOutput output)
		{
			if (Photo == null)
				return;
			
			output.TagName = "img";
			output.Attributes.Add("src", $"{Photo.Prefix}{Size}{Photo.Suffix}");
		}
	}
}
