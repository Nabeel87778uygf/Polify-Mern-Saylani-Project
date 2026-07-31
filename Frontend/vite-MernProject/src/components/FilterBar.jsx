import React from "react";
import {
    Scale,
    List,
    Star,
    Image,
    MessageSquare,
    Sparkles,
} from "lucide-react";

import { filterBarStyles as s } from "../assets/dummyStyles";
// Agar file ka naam dummyStyles.jsx hai to upar wali line ko:
// import { filterBarStyles as s } from "../assets/dummyStyles";

export const TYPE_META = {
    yesno: {
        label: "Yes / No",
        Icon: Scale,
    },
    single: {
        label: "Single Choice",
        Icon: List,
    },
    rating: {
        label: "Rating",
        Icon: Star,
    },
    image: {
        label: "Image",
        Icon: Image,
    },
    open: {
        label: "Open Ended",
        Icon: MessageSquare,
    },
};

export const FILTERS = [
    {
        key: "all",
        label: "All",
        Icon: Sparkles,
    },
    ...Object.entries(TYPE_META).map(([key, value]) => ({
        key,
        label: value.label,
        Icon: value.Icon,
    })),
];

const FilterBar = ({ value, onChange }) => {
    return (
        <div className={s.container}>
            {FILTERS.map((filter) => {
                const Icon = filter.Icon;

                return (
                    <button
                        key={filter.key}
                        type="button"
                        onClick={() => onChange?.(filter.key)}
                        className={`${s.filterButtonBase} ${value === filter.key ? s.filterButtonActive : s.filterButtonInactive}`}
                    >
                        <Icon size={16} />
                        <span>{filter.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default FilterBar;