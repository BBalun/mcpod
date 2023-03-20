SELECT ident.oidref, id FROM ident JOIN
(SELECT ident.oidref
FROM basic JOIN ident ON oidref = oid
WHERE id = 'HD48915') AS temp ON temp.oidref = ident.oidref


SELECT * FROM ident WHERE oidref IN 
(SELECT ident.oidref
  FROM basic JOIN ident ON oidref = oid
  WHERE id = 'HD48915')