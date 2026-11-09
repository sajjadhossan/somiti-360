const fs = require('fs');
const yaml = require('js-yaml');

const yamlContent = fs.readFileSync('render.yaml', 'utf8');
const parsed = yaml.load(yamlContent);

console.log('Validating render.yaml against official Render JSON Schema...');

fetch('https://render.com/schema/render.yaml.json')
  .then(r => r.json())
  .then(schema => {
    let hasError = false;
    const staticProps = schema.definitions.staticService.properties;
    for (const key of Object.keys(parsed.services[0])) {
      if (!staticProps[key]) {
        console.error('❌ INVALID STATIC KEY:', key);
        hasError = true;
      }
    }
    const serverProps = schema.definitions.serverService.properties;
    for (const key of Object.keys(parsed.services[1])) {
      if (!serverProps[key]) {
        console.error('❌ INVALID SERVER KEY:', key);
        hasError = true;
      }
    }
    if (!hasError) {
      console.log('✅ PERFECT: All properties in render.yaml match official Render JSON Schema!');
    } else {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Schema fetch error:', err);
    process.exit(1);
  });
