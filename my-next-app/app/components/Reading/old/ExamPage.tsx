import React from 'react';
import { useSearchParams } from 'next/navigation';

const ExamPage: React.FC = () => {
    const searchParams = useSearchParams();

    // Your logic here using `searchParams`

    return (
        <div>
            {/* Your page content here */}
        </div>
    );
};

export default ExamPage;
