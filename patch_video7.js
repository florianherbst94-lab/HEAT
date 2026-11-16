const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// We need to fix the TypeScript error. We can't use require('react').useRef<T>()
// We need to import useRef from 'react' at the top of the file

code = code.replace(
  /import \{ useState, useEffect \} from 'react';/,
  "import { useState, useEffect, useRef } from 'react';"
);

code = code.replace(
  /const videoRef = require\('react'\)\.useRef<HTMLVideoElement>\(null\);/,
  "const videoRef = useRef<HTMLVideoElement>(null);"
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
