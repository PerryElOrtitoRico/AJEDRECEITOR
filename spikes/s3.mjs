import { parsePgn, makePgn, startingPosition, transform, defaultGame } from 'chessops/pgn';
import { parseSan, makeSan } from 'chessops/san';
import { makeFen } from 'chessops/fen';
import { readFileSync } from 'fs';
for (const f of [1,2,3,4,5]) {
  const txt = readFileSync(`tests/fixtures/partida${f}.txt`,'utf8');
  const games = parsePgn(txt);
  const g = games[0];
  const out = makePgn(g);
  const again = parsePgn(out)[0];
  let n=0; for (const _ of g.moves.mainline()) n++;
  const com = [...g.moves.mainline()].filter(m=>m.comments?.length).length;
  console.log(f, 'games',games.length,'plies',n,'conMeta',com,'headers',[...g.headers.keys()].join(','),'roundtrip',makePgn(again)===out);
}
const v = parsePgn('1. e4 e5 (1... c5 {sici} 2. Nf3 (2. c3 $5)) 2. Nf3 {[%clk 0:03:00] bien} *')[0];
console.log(makePgn(v));
