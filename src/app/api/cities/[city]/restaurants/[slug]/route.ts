import {
  getCityDataset,
  getCityIds,
  getCityRestaurantDetail,
} from "@/lib/city-registry";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getCityIds().flatMap((city) => {
    const dataset = getCityDataset(city);

    if (!dataset) {
      return [];
    }

    return dataset.restaurants.map((restaurant) => ({
      city,
      slug: restaurant.slug,
    }));
  });
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/cities/[city]/restaurants/[slug]">,
) {
  const { city, slug } = await context.params;
  const restaurant = getCityRestaurantDetail(city, slug);

  if (!restaurant) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(
    { restaurant },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
