using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Alex.TagHelpers
{
	/// <summary>
	/// <see cref="ITagHelper"/> implementation targeting &lt;menulink&gt; elements that assist with rendering contextually aware menu links.
	/// If the current route is matched the given &lt;menulink&gt; will be active. This was added to demonstrate how a TagHelper might be used
	/// with Semantic UI to implement a simple menu.
	/// </summary>
	[HtmlTargetElement("menulink", Attributes = "controller-name, action-name, menu-text")]
	public class MenuLinkTagHelper : TagHelper
	{
		[HtmlAttributeName("controller-wildcard")]
		public bool WildcardController { get; set; }
		public string ControllerName { get; set; }
		public string ActionName { get; set; }
		public string MenuText { get; set; }

		[ViewContext]
		public ViewContext ViewContext { get; set; }

		public override void Process(TagHelperContext context, TagHelperOutput output)
		{
			var urlHelper = new UrlHelper(ViewContext);

			string menuUrl = urlHelper.Action(ActionName, ControllerName);

			output.TagName = "a";
			output.Attributes.Add("href", $"{menuUrl}");
			output.Attributes.Add("class", "item");
			output.Content.SetContent(MenuText);

			var routeData = ViewContext.RouteData.Values;
			var currentController = routeData["controller"];
			var currentAction = routeData["action"];

			if (String.Equals(ControllerName, currentController as string, StringComparison.OrdinalIgnoreCase))
				if (WildcardController || String.Equals(ActionName, currentAction as string, StringComparison.OrdinalIgnoreCase))
					output.Attributes.SetAttribute("class", "active item");
		}
	}
}
