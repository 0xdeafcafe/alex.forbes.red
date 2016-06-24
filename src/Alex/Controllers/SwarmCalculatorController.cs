using Microsoft.AspNetCore.Mvc;

namespace Alex.Controllers
{
	[Route("swarm-calculator")]
	public class SwarmCalculatorController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}

		public IActionResult Authorize()
		{
			return View();
		}
	}
}
