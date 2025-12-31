import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 12px 14px;
  padding-right: 40px;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  background: linear-gradient(135deg, #1a1020 0%, #0f0a15 100%);
  border: 1px solid ${props => props.$isOpen ? "#f59e0b" : "rgba(255, 180, 120, 0.25)"};
  border-radius: 10px;
  color: white;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: rgba(255, 180, 120, 0.5);
    background: linear-gradient(135deg, #221528 0%, #150d1c 100%);
  }

  &::after {
    content: "";
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%) ${props => props.$isOpen ? "rotate(180deg)" : "rotate(0)"};
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #f59e0b;
    transition: transform 0.2s ease;
  }

  ${props => props.$isOpen && `
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2), 0 4px 20px rgba(0, 0, 0, 0.4);
  `}
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: ${props => props.$isOpen ? "400px" : "0"};
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1225 0%, #0f0a15 100%);
  border: 1px solid rgba(255, 180, 120, 0.3);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 158, 11, 0.1);
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? "visible" : "hidden"};
  transform: ${props => props.$isOpen ? "translateY(0)" : "translateY(-10px)"};
  transition: all 0.2s ease;
  z-index: 100;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(245, 158, 11, 0.3);
    border-radius: 3px;
  }
`;

const GroupLabel = styled.div`
  padding: 10px 14px 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #f59e0b;
  background: linear-gradient(90deg, #2a1a35 0%, #1a1225 100%);
  border-bottom: 1px solid rgba(245, 158, 11, 0.3);
  position: sticky;
  top: 0;
`;

const OptionItem = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  padding: 10px 14px;
  padding-left: 20px;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  background: ${props => props.$isSelected
    ? "linear-gradient(90deg, #3d2a1a 0%, #1a1225 100%)"
    : "#1a1225"};
  border: none;
  color: ${props => props.$isSelected ? "#f59e0b" : "rgba(255, 255, 255, 0.85)"};
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;
  position: relative;

  ${props => props.$isSelected && `
    &::before {
      content: "";
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 4px;
      background: #f59e0b;
      border-radius: 50%;
      box-shadow: 0 0 6px #f59e0b;
    }
  `}

  &:hover {
    background: linear-gradient(90deg, #2a1a15 0%, #1a1225 100%);
    color: white;
  }

  &:active {
    background: #3d2a1a;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 180, 120, 0.2) 0%, transparent 80%);
  margin: 4px 0;
`;

interface Option {
  value: string;
  label: string;
}

interface OptionGroup {
  label: string;
  options: Option[];
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  groups: OptionGroup[];
  placeholder?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  groups,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find current label
  const currentLabel = groups
    .flatMap(g => g.options)
    .find(opt => opt.value === value)?.label || placeholder;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={containerRef}>
      <DropdownButton
        type="button"
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentLabel}
      </DropdownButton>

      <DropdownMenu $isOpen={isOpen}>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={group.label}>
            {groupIndex > 0 && <Divider />}
            <GroupLabel>{group.label}</GroupLabel>
            {group.options.map(option => (
              <OptionItem
                key={option.value}
                type="button"
                $isSelected={option.value === value}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </OptionItem>
            ))}
          </React.Fragment>
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
};

export default CustomDropdown;
