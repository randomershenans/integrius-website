'use client';

export function SpaceBackground() {
  return (
    <>
      <div className="fixed inset-0 z-[-2] bg-black" />
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,184,212,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,145,234,0.08) 0%, transparent 50%)',
        }}
      />
    </>
  );
}
