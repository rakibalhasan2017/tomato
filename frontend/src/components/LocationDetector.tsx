interface LocationDetectorProps {
  locationLabel: string;
  locationError: string | null;
  isLocating: boolean;
  locationGranted: boolean;
  onGetLocation: () => void;
}

export const LocationDetector = ({
  locationLabel,
  locationError,
  isLocating,
  locationGranted,
  onGetLocation,
}: LocationDetectorProps) => {
  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onGetLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 text-sm text-white bg-white/20 hover:bg-white/30 transition rounded-full px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
            />
          </svg>
          {isLocating ? 'Detecting...' : locationGranted ? 'Update location' : 'Detect my location'}
        </button>

        <span className="text-red-100 text-sm truncate max-w-xs">{locationLabel}</span>
      </div>

      {locationError && (
        <p className="mt-2 text-sm text-red-100 bg-red-700/40 rounded-lg px-3 py-2 max-w-md">
          {locationError}
        </p>
      )}
    </div>
  );
};
