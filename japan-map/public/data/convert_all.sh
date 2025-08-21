#!/bin/bash

# Define the input directory and output directory
input_dir="./"
output_dir="./tiles"

# Create output directory if it doesn't exist
mkdir -p "$output_dir"

# Loop through all GeoJSON files in the input directory
for geojson in "$input_dir"/*.geojson; do
  # Get the base name of the file (without path or extension)
  base_name=$(basename "$geojson" .geojson)

  # Define the output MBTiles file path
  output_mbtiles="$output_dir/$base_name.mbtiles"

  # Run Tippecanoe to convert the GeoJSON to MBTiles
  echo "Converting $geojson to $output_mbtiles"
  tippecanoe -o "$output_mbtiles" -z18 -Z4 --no-feature-limit --no-tile-size-limit -r0 -f "$geojson"
done

echo "Conversion complete!"
