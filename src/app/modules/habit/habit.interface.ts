import { Types } from 'mongoose';

export enum HabitUnitType {
  'Custom' = 'Custom',
  'Time' = 'Time',
}

export enum HabitUnitNameForTime {
  'Minute' = 'Minute',
  'Hour' = 'Hour',
}

export type HabitUnitName = HabitUnitNameForTime | string;

export interface IHabitUnit {
  type: HabitUnitType;
  name: HabitUnitName;
  usageCount?: number;
}

export type HabitUnitCreationData = Pick<IHabitUnit, 'type' | 'name'>;

export interface IHabitDifficulties {
  mini: number;
  plus: number;
  elite: number;
}

export interface IHabit {
  title: string;
  unit: Types.ObjectId;
  usageCount?: number;
  difficulties: IHabitDifficulties;
}

export type HabitDifficultiesName = keyof IHabitDifficulties;

export type HabitCreationData = Omit<IHabit, 'usageCount'>;



// new habit interface

export interface IActivity {
  name: string;
  quantity: number;
  unit: Types.ObjectId;
}

export type SelectionRule = "required" | "oneOf";

export interface IActivityGroup {
  selectionRule: SelectionRule;
  activities: IActivity[];
}

export interface IElasticHabit {
  mini: IActivityGroup[];
  plus: IActivityGroup[];
  elite: IActivityGroup[];
  usageCount: number; 
}

