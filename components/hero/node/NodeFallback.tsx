export function NodeFallback({ loading = false }: { loading?: boolean }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      role="img"
      aria-label={
        loading ? "Loading NODE_7388" : "Static NODE_7388 compute architecture"
      }
    >
      <svg
        viewBox="0 0 420 420"
        className="h-[80%] max-h-[420px] w-[80%]"
        aria-hidden="true"
      >
        <g fill="none" stroke="#315BFF" strokeOpacity=".1">
          <path d="M40 140h340M40 210h340M40 280h340M140 40v340M210 40v340M280 40v340" />
        </g>
        <path
          d="m210 60 130 75v150l-130 75-130-75V135Z"
          fill="#fff"
          fillOpacity=".5"
          stroke="#94a3b8"
        />
        <path
          d="m80 135 130 75 130-75M210 210v150"
          fill="none"
          stroke="#00C8FF"
          strokeOpacity=".6"
        />
        <path
          d="m210 151 51 29v60l-51 29-51-29v-60Z"
          fill="#111722"
          stroke="#00C8FF"
        />
        <g stroke="#00C8FF" fill="none">
          <path d="m159 195-50-30m152 30 50-30m-101 104v59" />
        </g>
        <text
          x="210"
          y="214"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fill="#F4F7FA"
        >
          7388
        </text>
        <text
          x="210"
          y="397"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="10"
          letterSpacing="3"
          fill="#52606F"
        >
          {loading ? "NODE_7388 / LOADING" : "NODE_7388 / STATIC"}
        </text>
      </svg>
    </div>
  );
}
