const fs = require('fs');
let code = fs.readFileSync('src/components/admin/GalleryManager.tsx', 'utf8');

// Change file input to multiple
code = code.replace(
  'type="file"',
  'type="file" multiple'
);

// Rewrite handleFileUpload to loop over files
code = code.replace(
  /  async function handleFileUpload\(e: React\.ChangeEvent<HTMLInputElement>\) \{[\s\S]*?\n  \}\n\n  async function deleteImage/,
  `  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate size (max 5MB per file)
    const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      alert(\`\${oversized.length} Bild(er) sind größer als 5 MB und werden nicht hochgeladen.\`);
    }
    
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length === 0) return;

    setUploading(true);
    let nextOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) + 1 : 0;
    
    let successCount = 0;
    
    // Upload sequentially to avoid overloading the server/database
    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('order', nextOrder.toString());

      try {
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          successCount++;
          nextOrder++; // Increment for the next image in the batch
        }
      } catch (err) {
        console.error('Upload failed for', file.name);
      }
    }
    
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (successCount > 0) {
      alert(\`\${successCount} von \${validFiles.length} Bild(ern) erfolgreich hochgeladen!\`);
      fetchImages();
    } else {
      alert('Fehler beim Hochladen der Bilder.');
    }
  }

  async function deleteImage`
);

fs.writeFileSync('src/components/admin/GalleryManager.tsx', code);
