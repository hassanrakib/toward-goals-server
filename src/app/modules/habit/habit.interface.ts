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
export type TaskType = "direct" | "reference";
export type HabitLevel = "mini" | "plus" | "elite";

export interface ITask {
  type: TaskType;

  // DIRECT task
  count?: number;
  unit?: string;

  // REFERENCE task
  refActivity?: string;   // ObjectId as string
  refLevel?: HabitLevel;
}

export type SelectionType = "required" | "oneOf";

export interface IOptionGroup {
  description?: string;
  selectionType: SelectionType;
  tasks: ITask[];
}

export interface IActivityLevels {
  mini: IOptionGroup[];
  plus: IOptionGroup[];
  elite: IOptionGroup[];
}

export interface IActivity {
  _id?: string;
  name: string;
  userId?: string; // ObjectId as string
  levels: IActivityLevels;
}

