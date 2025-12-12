import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoMetadata, DanceStyle } from '@/lib/types/api';

interface VideoMetadataFormProps {
  onSubmit: (metadata: VideoMetadata) => void;
  onCancel: () => void;
  isLoading?: boolean;
  fileName?: string;
}

interface FormData {
  title: string;
  description: string;
  danceStyle: DanceStyle[];
  choreographer: string;
  musicTitle: string;
  musicArtist: string;
  musicGenre: string;
}

const danceStyles: DanceStyle[] = [
  'Ballet',
  'Hip-Hop',
  'Contemporary',
  'Jazz',
  'Ballroom',
  'Latin',
  'Freestyle',
  'Breakdancing',
];

export function VideoMetadataForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  fileName 
}: VideoMetadataFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<FormData>({
    defaultValues: {
      title: fileName ? fileName.replace(/\.[^/.]+$/, '') : '',
      description: '',
      danceStyle: [],
      choreographer: '',
      musicTitle: '',
      musicArtist: '',
      musicGenre: '',
    },
    mode: 'onChange'
  });

  const selectedStyles = watch('danceStyle') || [];

  const handleStyleToggle = (style: DanceStyle) => {
    const currentStyles = selectedStyles;
    const newStyles = currentStyles.includes(style)
      ? currentStyles.filter(s => s !== style)
      : [...currentStyles, style];
    setValue('danceStyle', newStyles, { shouldValidate: true });
  };

  const onFormSubmit = (data: FormData) => {
    const metadata: VideoMetadata = {
      title: data.title,
      description: data.description || undefined,
      danceStyle: data.danceStyle.length > 0 ? data.danceStyle : undefined,
      choreographer: data.choreographer || undefined,
      musicInfo: (data.musicTitle || data.musicArtist || data.musicGenre) ? {
        title: data.musicTitle || undefined,
        artist: data.musicArtist || undefined,
        genre: data.musicGenre || undefined,
      } : undefined,
    };
    onSubmit(metadata);
  };

  return (
    <Card className="border-green-900/30 bg-black/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          Video Details
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Add details about your dance video to help with analysis
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter a title for your dance video"
              className="bg-gray-900/50 border-green-900/30 text-white placeholder-gray-500 focus:border-green-500"
            />
            {errors.title && (
              <p className="text-red-400 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your dance routine, style, or any special notes"
              rows={3}
              className="bg-gray-900/50 border-green-900/30 text-white placeholder-gray-500 focus:border-green-500 resize-none"
            />
          </div>

          {/* Dance Styles */}
          <div className="space-y-3">
            <Label className="text-white">Dance Styles</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {danceStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleStyleToggle(style)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedStyles.includes(style)
                      ? 'bg-green-600 text-black shadow-lg shadow-green-500/30'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Choreographer */}
          <div className="space-y-2">
            <Label htmlFor="choreographer" className="text-white">
              Choreographer
            </Label>
            <Input
              id="choreographer"
              {...register('choreographer')}
              placeholder="Who choreographed this routine?"
              className="bg-gray-900/50 border-green-900/30 text-white placeholder-gray-500 focus:border-green-500"
            />
          </div>

          {/* Music Information */}
          <div className="space-y-4">
            <Label className="text-white">Music Information (Optional)</Label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="musicTitle" className="text-gray-300 text-sm">
                  Song Title
                </Label>
                <Input
                  id="musicTitle"
                  {...register('musicTitle')}
                  placeholder="Song title"
                  className="bg-gray-900/50 border-green-900/30 text-white placeholder-gray-500 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="musicArtist" className="text-gray-300 text-sm">
                  Artist
                </Label>
                <Input
                  id="musicArtist"
                  {...register('musicArtist')}
                  placeholder="Artist name"
                  className="bg-gray-900/50 border-green-900/30 text-white placeholder-gray-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="musicGenre" className="text-gray-300 text-sm">
                Genre
              </Label>
              <Input
                id="musicGenre"
                {...register('musicGenre')}
                placeholder="Music genre"
                className="bg-gray-900/50 border-green-900/30 text-white placeholder-gray-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-green-600/50 text-green-400 hover:bg-green-950/30 bg-transparent"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Starting Analysis...
                </div>
              ) : (
                'Start Analysis'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}