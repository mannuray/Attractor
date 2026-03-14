import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { colors, glassEffect } from "../attractors/shared/styles";

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 8px 12px;
  padding-right: 36px;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  font-family: 'JetBrains Mono', monospace;
  background: ${colors.darkestBg};
  border: 1px solid ${props => props.$isOpen ? colors.accent : colors.accentBorder};
  border-radius: 4px;
  color: ${colors.white};
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${colors.accentLight};
    background: ${colors.accentSubtle};
  }

  &::after {
    content: "";
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%) ${props => props.$isOpen ? "rotate(180deg)" : "rotate(0)"};
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid ${colors.accent};
    transition: transform 0.3s ease;
  }

  ${props => props.$isOpen && `
    box-shadow: 0 0 15px ${colors.accentSubtle};
  `}
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: ${props => props.$isOpen ? "300px" : "0"};
  overflow-y: auto;
  ${glassEffect}
  border-radius: 4px;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? "visible" : "hidden"};
  transform: ${props => props.$isOpen ? "translateY(0)" : "translateY(-5px)"};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.accentMuted};
    border-radius: 2px;
  }
`;

const GroupLabel = styled.div`
  padding: 8px 12px 4px;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${colors.accentLight};
  background: ${colors.accentSubtle};
  border-bottom: 1px solid ${colors.accentMuted};
  position: sticky;
  top: 0;
  z-index: 10;
  font-family: 'JetBrains Mono', monospace;
`;

const OptionItem = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  padding: 8px 12px;
  padding-left: 20px;
  font-size: 11px;
  font-weight: 600;
  text-align: left;
  font-family: 'JetBrains Mono', monospace;
  background: ${props => props.$isSelected
    ? colors.accentSubtle
    : "transparent"};
  border: none;
  color: ${props => props.$isSelected ? colors.accent : "rgba(255, 255, 255, 0.6)"};
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;
  position: relative;

  ${props => props.$isSelected && `
    &::before {
      content: ">";
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: ${colors.accent};
      font-size: 10px;
    }
  `}

  &:hover {
    background: ${colors.accentMuted};
    color: white;
    padding-left: 24px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${colors.accentMuted};
  margin: 2px 0;
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

  const currentLabel = groups
    .flatMap(g => g.options)
    .find(opt => opt.value === value)?.label || placeholder;

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
