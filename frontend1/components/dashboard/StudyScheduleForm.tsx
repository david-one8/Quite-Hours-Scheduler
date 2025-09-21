// components/dashboard/StudyScheduleForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { studyAPI, StudySchedule, handleApiError } from '@/lib/api';
import { Clock, BookOpen, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

interface StudyScheduleFormData {
  studyTopic: string;
  studyTime: string;
  days: string[];
  description?: string;
}

interface StudyScheduleFormProps {
  schedule?: StudySchedule;
  onScheduleCreated: (schedule: StudySchedule) => void;
  onScheduleUpdated: (schedule: StudySchedule) => void;
  onCancel: () => void;
}

export default function StudyScheduleForm({ 
  schedule, 
  onScheduleCreated, 
  onScheduleUpdated, 
  onCancel 
}: StudyScheduleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<StudyScheduleFormData>({
    defaultValues: schedule ? {
      studyTopic: schedule.studyTopic,
      studyTime: schedule.studyTime,
      days: schedule.days,
      description: schedule.description || ''
    } : {
      studyTopic: '',
      studyTime: '',
      days: [],
      description: ''
    }
  });

  const selectedDays = watch('days');

  const onSubmit = async (data: StudyScheduleFormData) => {
    try {
      if (schedule) {
        const response = await studyAPI.update(schedule._id, data);
        if (response.data.success) {
          onScheduleUpdated(response.data.data!.schedule);
        }
      } else {
        const response = await studyAPI.create(data);
        if (response.data.success) {
          onScheduleCreated(response.data.data!.schedule);
        }
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      const message = handleApiError(error);
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {schedule ? 'Edit Study Schedule' : 'Create New Study Schedule'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Set up your study reminder preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Study Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="inline h-4 w-4 mr-1" />
            Study Topic
          </label>
          <input
            {...register('studyTopic', {
              required: 'Study topic is required',
              minLength: { value: 1, message: 'Topic must be at least 1 character' },
              maxLength: { value: 100, message: 'Topic cannot exceed 100 characters' }
            })}
            type="text"
            className={`input-field ${
              errors.studyTopic ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="e.g., JavaScript Fundamentals, Calculus Chapter 3..."
          />
          {errors.studyTopic && (
            <p className="mt-1 text-sm text-red-600">{errors.studyTopic.message}</p>
          )}
        </div>

        {/* Study Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Study Time
          </label>
          <input
            {...register('studyTime', {
              required: 'Study time is required',
              pattern: {
                value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: 'Please enter time in HH:MM format'
              }
            })}
            type="time"
            className={`input-field ${
              errors.studyTime ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          />
          {errors.studyTime && (
            <p className="mt-1 text-sm text-red-600">{errors.studyTime.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            💡 You'll receive a reminder 10 minutes before this time
          </p>
        </div>

        {/* Days Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Calendar className="inline h-4 w-4 mr-1" />
            Select Days
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DAYS_OPTIONS.map((day) => (
              <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register('days', {
                    required: 'Please select at least one day'
                  })}
                  type="checkbox"
                  value={day.value}
                  className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{day.label}</span>
              </label>
            ))}
          </div>
          {errors.days && (
            <p className="mt-1 text-sm text-red-600">{errors.days.message}</p>
          )}
          {selectedDays && selectedDays.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Selected: {selectedDays.length} day{selectedDays.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Description (Optional)
          </label>
          <textarea
            {...register('description', {
              maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
            })}
            rows={3}
            className={`input-field resize-none ${
              errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="Add any notes about this study session..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 btn-primary"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {schedule ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              schedule ? 'Update Schedule' : 'Create Schedule'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
