import { useState, useEffect } from 'react';

const useMediaQuery = (maxWidth) => {
    const [matches, setMatches] = useState(window.innerWidth <= maxWidth);

    useEffect(() => {
        const handleResize = () => {
            setMatches(window.innerWidth <= maxWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [maxWidth]);

    return matches;
};

export default useMediaQuery;