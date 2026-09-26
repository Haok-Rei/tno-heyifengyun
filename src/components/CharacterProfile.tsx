import type { CharacterTrait } from '../data/characterProfiles';
import './characterProfile.css';

interface CharacterProfileProps {
  name: string;
  title?: string;
  description?: string;
  traits: CharacterTrait[];
  compact?: boolean;
}

export default function CharacterProfile({ name, title, description, traits, compact = false }: CharacterProfileProps) {
  return (
    <div className={`character-profile${compact ? ' character-profile--compact' : ''}`}>
      <div className="character-profile__heading"><strong>{name}</strong>{title && <span>{title}</span>}</div>
      <p className="character-profile__description">{description || '暂无人物档案。'}</p>
      <div className="character-profile__traits">
        <div className="character-profile__label">特质</div>
        {traits.length ? traits.map((trait, index) => (
          <div key={`${trait.text}-${index}`} className={`character-profile__trait ${trait.positive ? 'is-positive' : 'is-negative'}`}>
            <span aria-hidden="true">{trait.positive ? '▲' : '▼'}</span>{trait.text}
          </div>
        )) : <div className="character-profile__none">暂无数值特质</div>}
      </div>
    </div>
  );
}
