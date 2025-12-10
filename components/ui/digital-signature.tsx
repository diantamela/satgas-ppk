"use client";

import React, { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Undo2, Download, Upload, PenTool } from 'lucide-react';

interface DigitalSignatureProps {
  label: string;
  value?: string;
  onChange?: (signatureData: string, signerName: string) => void;
  required?: boolean;
  placeholder?: string;
  signerNameLabel?: string;
  signerName?: string;
  onSignerNameChange?: (name: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function DigitalSignature({
  label,
  value,
  onChange,
  required = false,
  placeholder = "Tanda tangan di sini...",
  signerNameLabel = "Nama Penanda Tangan",
  signerName = "",
  onSignerNameChange,
  disabled = false,
  className = ""
}: DigitalSignatureProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [hasSignature, setHasSignature] = useState(!!value);
  const [currentSignerName, setCurrentSignerName] = useState(signerName);

  useEffect(() => {
    setHasSignature(!!value);
    if (value && signatureRef.current) {
      signatureRef.current.fromDataURL(value);
      setIsEmpty(false);
    }
  }, [value]);

  useEffect(() => {
    setCurrentSignerName(signerName);
  }, [signerName]);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
      setHasSignature(false);
      onChange?.("", currentSignerName);
    }
  };

  const handleUndo = () => {
    if (signatureRef.current && !isEmpty) {
      const data = signatureRef.current.toData();
      if (data.length > 0) {
        data.pop();
        signatureRef.current.fromData(data);
        if (data.length === 0) {
          setIsEmpty(true);
          setHasSignature(false);
        }
        onChange?.(signatureRef.current.toDataURL(), currentSignerName);
      }
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleEnd = () => {
    if (signatureRef.current && !isEmpty) {
      const signatureData = signatureRef.current.toDataURL();
      setHasSignature(true);
      onChange?.(signatureData, currentSignerName);
    }
  };

  const handleSignerNameChange = (name: string) => {
    setCurrentSignerName(name);
    onSignerNameChange?.(name);
    
    // Update signature with new name if signature exists
    if (signatureRef.current && !isEmpty) {
      const signatureData = signatureRef.current.toDataURL();
      onChange?.(signatureData, name);
    }
  };

  const downloadSignature = () => {
    if (signatureRef.current && !isEmpty) {
      const dataURL = signatureRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = `tanda-tangan-${currentSignerName || 'unknown'}-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          {/* Signer Name Input */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              {signerNameLabel}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              value={currentSignerName}
              onChange={(e) => handleSignerNameChange(e.target.value)}
              placeholder="Masukkan nama terang penanda tangan"
              disabled={disabled}
              className="text-sm"
            />
          </div>
        </div>

        {/* Signature Canvas */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-600 dark:text-gray-400">
            Area Tanda Tangan
          </Label>
          <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 400,
                height: 150,
                className: `signature-canvas w-full h-[150px] bg-white dark:bg-gray-800 ${disabled ? 'opacity-50 pointer-events-none' : ''}`,
                style: { border: 'none' }
              }}
              onBegin={handleBegin}
              onEnd={handleEnd}
              backgroundColor="rgba(255,255,255,0)"
              penColor="#000000"
              minWidth={0.5}
              maxWidth={2.5}
              throttle={16}
              minDistance={5}
            />
            
            {/* Placeholder text when empty */}
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-50 dark:bg-gray-800/50">
                <div className="text-center space-y-2">
                  <PenTool className="w-6 h-6 mx-auto text-gray-400" />
                  <span className="text-gray-400 text-sm italic block">
                    {placeholder}
                  </span>
                  <span className="text-xs text-gray-400">
                    Klik dan drag untuk menandatangani
                  </span>
                </div>
              </div>
            )}
            
            {/* Active drawing indicator */}
            {!isEmpty && !disabled && (
              <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Tanda tangan aktif
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled || isEmpty}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Hapus
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={disabled || isEmpty}
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Undo
          </Button>
          
          {hasSignature && !isEmpty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadSignature}
              disabled={disabled}
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}
        </div>

        {/* Signature Info */}
        {hasSignature && !isEmpty && currentSignerName && (
          <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
            ✓ Tanda tangan tersimpan untuk: <strong>{currentSignerName}</strong>
          </div>
        )}
      </CardContent>
    </Card>
  );
}