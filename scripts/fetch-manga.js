const fs = require('fs');
const path = require('path');

async function fetchMangaPage(limit, offset) {
  const url = `https://api.mangadex.org/manga?limit=${limit}&offset=${offset}&contentRating[]=safe&order[followedCount]=desc&includes[]=cover_art&includes[]=author&availableTranslatedLanguage[]=en`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`MangaDex API error: ${res.statusText}`);
  }
  return await res.json();
}

async function main() {
  console.log("Fetching 300 mangas from MangaDex API...");
  const limit = 100;
  const targetCount = 300;
  const mangas = [];
  
  for (let offset = 0; offset < targetCount; offset += limit) {
    console.log(`Fetching offset ${offset}...`);
    try {
      const data = await fetchMangaPage(limit, offset);
      if (!data.data || data.data.length === 0) {
        console.log("No more mangas found.");
        break;
      }
      
      for (const item of data.data) {
        const id = item.id;
        const attrs = item.attributes;
        
        // 1. Title
        const title = attrs.title.en || attrs.title[Object.keys(attrs.title)[0]] || "Untitled";
        
        // 2. Description
        const description = attrs.description.en || "";
        
        // 3. Author
        const authorObj = item.relationships.find(r => r.type === 'author');
        const author = (authorObj && authorObj.attributes && authorObj.attributes.name) || "Unknown Author";
        
        // 4. Cover image
        const coverObj = item.relationships.find(r => r.type === 'cover_art');
        const coverFilename = coverObj && coverObj.attributes && coverObj.attributes.fileName;
        const cover = coverFilename 
          ? `https://uploads.mangadex.org/covers/${id}/${coverFilename}.256.jpg`
          : "https://placehold.co/256x364?text=No+Cover";
          
        // 5. Category (first tag of genre/theme)
        const genreTag = attrs.tags.find(t => t.attributes.group === 'genre') || attrs.tags.find(t => t.attributes.group === 'theme') || attrs.tags[0];
        const category = (genreTag && genreTag.attributes.name.en) || "Manga";
        
        // 6. Price: random between 50,000 and 150,000 VND
        const price = Math.floor(Math.random() * 21 + 10) * 5000;
        
        mangas.push({
          id,
          title,
          author,
          price,
          category,
          description,
          cover
        });
      }
      
      // Sleep a bit to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error fetching offset ${offset}:`, error);
      process.exit(1);
    }
  }
  
  console.log(`Fetched ${mangas.length} mangas successfully.`);
  
  // Ensure directory exists
  const destDir = path.join(__dirname, '..', 'assets', 'practice');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const destPath = path.join(destDir, 'manga.json');
  fs.writeFileSync(destPath, JSON.stringify(mangas, null, 2), 'utf-8');
  console.log(`Saved manga database to: ${destPath}`);
}

main();
