export default function Header() {
  return (
    <div className="text-center mb-7">
      <div className="inline-flex items-center gap-2.5 px-[18px] py-2 bg-gradient-to-br from-cyan-400/10 to-indigo-500/10 rounded-full border border-cyan-400/15 mb-3.5">
        <span className="text-xl">🛡️</span>
        <span className="text-xl font-black bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent tracking-widest">
          CyberGuardians
        </span>
      </div>
      <p className="text-slate-500 text-xs m-0 tracking-wider">
        攻撃者の目線で学ぶ、サイバーセキュリティ体験学習
      </p>
    </div>
  );
}
