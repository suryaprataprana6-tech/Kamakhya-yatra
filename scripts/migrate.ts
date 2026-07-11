import { supabaseServer } from "../src/utils/supabaseServer";
import { packagesData } from "../src/data/packages";

async function runMigration() {
  console.log(`Starting migration of ${packagesData.length} packages...`);

  // Clear existing items in packages table if they exist
  const { error: deleteError } = await supabaseServer
    .from("packages")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    console.warn("Could not clear existing packages:", deleteError.message);
  }

  // Insert the packages
  for (const pkg of packagesData) {
    console.log(`Migrating: ${pkg.title} (ID: ${pkg.id})`);
    
    const { error: insertError } = await supabaseServer
      .from("packages")
      .insert({
        id: pkg.id,
        title: pkg.title,
        image: pkg.image,
        duration: pkg.duration,
        price: pkg.price,
        category: pkg.category,
        slug: pkg.slug,
        location: pkg.location,
        rating: pkg.rating,
        description: pkg.description,
        overview: pkg.description, // Default overview to description
        whats_included: pkg.inclusions, // Maps inclusions array to jsonb
        itinerary: pkg.itinerary, // Maps itinerary array to jsonb
      });

    if (insertError) {
      console.error(`Error inserting package ${pkg.title}:`, insertError.message);
      process.exit(1);
    }
  }

  console.log("Migration completed successfully!");
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
