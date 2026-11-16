const fs = require('fs');
let code = fs.readFileSync('src/components/admin/GalleryManager.tsx', 'utf8');

// Change `multiple ` to `multiple={true}` which is strictly correct for React JSX
code = code.replace(
  /type="file" multiple /,
  'type="file" multiple={true} '
);

fs.writeFileSync('src/components/admin/GalleryManager.tsx', code);
