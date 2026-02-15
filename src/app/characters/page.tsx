import { CHARACTERS } from "@/data/characters";

export default function CharactersPage() {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-center mb-2">
        <div className="text-[15px] font-bold text-slate-400">
          サイバーシティの住人たち
        </div>
        <div className="text-[11px] text-slate-600 mt-1">
          コンピュータの仕組みを擬人化したキャラクター
        </div>
      </div>

      {Object.values(CHARACTERS).map((char) => (
        <div
          key={char.name}
          className="p-[18px] rounded-[14px] flex items-center gap-3.5"
          style={{
            background: `linear-gradient(135deg, ${char.color}08, transparent)`,
            border: `1px solid ${char.color}20`,
          }}
        >
          <div
            className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[28px] shrink-0"
            style={{
              background: `${char.color}15`,
              border: `1px solid ${char.color}25`,
            }}
          >
            {char.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-200">
                {char.name}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-semibold"
                style={{
                  background: `${char.color}20`,
                  color: char.color,
                }}
              >
                {char.role}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 leading-normal">
              {char.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
