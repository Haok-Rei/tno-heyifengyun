/** Extract actual focus completion -> event links without executing campaign effects. */
import ts from 'typescript';
import fs from 'node:fs';
import { FLAVOR_EVENTS } from '../../src/data/flavorEvents';
import { STORY_EVENTS } from '../../src/data/storyEvents';
import { ROUTE_FOCUS_ART } from '../../src/config/routeIconArtwork';

const source = ts.createSourceFile('FocusTree.tsx', fs.readFileSync('src/components/FocusTree.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const found = new Map<string, Set<string>>();
function visit(node: ts.Node) {
  if (ts.isObjectLiteralExpression(node)) {
    const id = node.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(source) === 'id');
    const completion = node.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(source) === 'onComplete');
    if (id && ts.isPropertyAssignment(id) && ts.isStringLiteral(id.initializer) && completion) {
      const focusId = id.initializer.text;
      if (ROUTE_FOCUS_ART[focusId]) {
        const scan = (part: ts.Node) => {
          if (ts.isPropertyAssignment(part) && part.name.getText(source) === 'activeEvent' && ts.isObjectLiteralExpression(part.initializer)) {
            const inlineId = part.initializer.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(source)==='id');
            if (inlineId && ts.isPropertyAssignment(inlineId) && ts.isStringLiteral(inlineId.initializer)) {
              const set=found.get(inlineId.initializer.text) ?? new Set();
              set.add(focusId); found.set(inlineId.initializer.text,set);
            }
          }
          if (ts.isPropertyAccessExpression(part) && ts.isIdentifier(part.expression)) {
            const group = part.expression.text === 'FLAVOR_EVENTS' ? FLAVOR_EVENTS : part.expression.text === 'STORY_EVENTS' ? STORY_EVENTS : null;
            const event = group?.[part.name.text as keyof typeof group];
            if (event) {
              const set = found.get(event.id) ?? new Set();
              set.add(focusId); found.set(event.id, set);
            }
          }
          ts.forEachChild(part, scan);
        };
        scan(completion);
      }
    }
  }
  ts.forEachChild(node, visit);
}
visit(source);
// Ambiguous shared events retain their deliberately authored original binding.
const links = Object.fromEntries([...found].filter(([,set]) => set.size === 1).map(([id,set]) => [id,[...set][0]]).sort());
fs.writeFileSync('src/config/campaignEventArt.json', JSON.stringify(links, null, 2) + '\n');
console.log(`Linked ${Object.keys(links).length} events to their actual completing focus.`);
